from rest_framework import serializers
from .models import Document, Signer, FormField, AuditEvent
from django.contrib.auth import get_user_model
from core import fields
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    id = fields.PrimaryRefField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']

class FormFieldSerializer(serializers.ModelSerializer):
    id = fields.PrimaryRefField(read_only=True)
    signer = fields.UUIDRelatedField(queryset=Signer.objects.all())
    
    class Meta:
        model = FormField
        fields = [
            'id', 'document', 'signer', 'type', 'x', 'y', 'width', 'height',
            'page', 'required', 'value', 'label', 'created_at', 'modified_at'
        ]
        read_only_fields = ['created_at', 'modified_at']

class SignerSerializer(serializers.ModelSerializer):
    id = fields.PrimaryRefField(read_only=True)
    fields = FormFieldSerializer(many=True, read_only=True)
    
    class Meta:
        model = Signer
        fields = [
            'id', 'document', 'email', 'name', 'role', 'order', 'status',
            'signed_at', 'viewed_at', 'fields', 'created_at', 'modified_at'
        ]
        read_only_fields = ['created_at', 'modified_at', 'signed_at', 'viewed_at']



class AuditEventSerializer(serializers.ModelSerializer):
    id = fields.PrimaryRefField(read_only=True)
    user = UserSerializer(read_only=True)
    # document = DocumentSerializer(read_only=True)
    
    class Meta:
        model = AuditEvent
        fields = [
            'id', 'document', 'user', 'email', 'action', 'timestamp',
            'ip_address', 'user_agent', 'created_at', 'modified_at'
        ]
        read_only_fields = ['created_at', 'modified_at', 'timestamp'] 

class DocumentSerializer(serializers.ModelSerializer):
    id = fields.PrimaryRefField(read_only=True)
    owner = UserSerializer(read_only=True)
    signers = SignerSerializer(many=True, read_only=True)
    fields = FormFieldSerializer(many=True, read_only=True)
    audit_trail = AuditEventSerializer(many=True,read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'created_at', 'modified_at',
            'owner', 'status', 'file', 'file_type', 'signers', 'audit_trail','fields'
        ]
        read_only_fields = ['created_at', 'modified_at']