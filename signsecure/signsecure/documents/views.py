from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Document, Signer, FormField, AuditEvent
from .serializers import (
    DocumentSerializer, SignerSerializer,
    FormFieldSerializer, AuditEventSerializer
)
from .signals import (
    document_created, document_sent, document_viewed,
    document_signed, document_completed, document_uploaded,
    signer_added, field_added
)

# Create your views here.

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        document = serializer.save(owner=self.request.user)
        document_created.send(
            sender=self.__class__,
            document=document,
            user=self.request.user,
            email=self.request.user.email,
            action='document_created',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    @action(detail=True, methods=['post'])
    def send_for_signature(self, request, pk=None):
        document = self.get_object()
        if document.status != 'draft':
            return Response(
                {'error': 'Only draft documents can be sent for signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        document.status = 'sent'
        document.save()
        
        document_sent.send(
            sender=self.__class__,
            document=document,
            user=request.user,
            email=request.user.email,
            action='document_sent',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'document sent for signature'})

class SignerViewSet(viewsets.ModelViewSet):
    serializer_class = SignerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Signer.objects.filter(document__owner=self.request.user)

    def perform_create(self, serializer):
        signer = serializer.save()
        signer_added.send(
            sender=self.__class__,
            document=signer.document,
            user=self.request.user,
            email=self.request.user.email,
            action='signer_added',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    @action(detail=True, methods=['post'])
    def mark_as_viewed(self, request, pk=None):
        signer = self.get_object()
        signer.viewed_at = timezone.now()
        signer.save()
        
        document_viewed.send(
            sender=self.__class__,
            document=signer.document,
            user=request.user,
            email=signer.email,
            action='document_viewed',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'document marked as viewed'})

    @action(detail=True, methods=['post'])
    def sign_document(self, request, pk=None):
        signer = self.get_object()
        if signer.status == 'signed':
            return Response(
                {'error': 'Document already signed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        signer.status = 'signed'
        signer.signed_at = timezone.now()
        signer.save()
        
        # Check if all signers have signed
        all_signed = not Signer.objects.filter(
            document=signer.document,
            status='pending'
        ).exists()
        
        if all_signed:
            signer.document.status = 'completed'
            signer.document.save()
            
            document_completed.send(
                sender=self.__class__,
                document=signer.document,
                user=request.user,
                email=signer.email,
                action='document_completed',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        document_signed.send(
            sender=self.__class__,
            document=signer.document,
            user=request.user,
            email=signer.email,
            action='document_signed',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'status': 'document signed successfully'})

class FormFieldViewSet(viewsets.ModelViewSet):
    serializer_class = FormFieldSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FormField.objects.filter(document__owner=self.request.user)

    def perform_create(self, serializer):
        field = serializer.save()
        field_added.send(
            sender=self.__class__,
            document=field.document,
            user=self.request.user,
            email=self.request.user.email,
            action='field_added',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AuditEvent.objects.filter(document__owner=self.request.user)
