from django.db import models
from django.contrib.auth import get_user_model
from core.models import BaseModel
from django.utils import timezone
import jwt
from django.conf import settings
import uuid
User = get_user_model()

class Document(BaseModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_documents')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    file = models.FileField()
    file_type = models.CharField(max_length=100)

    def __str__(self):
        return self.title

def generate_default_token():
    """Generate a default token for new signers"""
    payload = {
        'temp_id': str(uuid.uuid4()),
        'exp': timezone.now() + timezone.timedelta(days=30)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

class Signer(BaseModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('signed', 'Signed'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='signers')
    email = models.EmailField()
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100)
    order = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    signed_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    token = models.TextField(unique=True, default=generate_default_token)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} - {self.document.title}"

    def save(self, *args, **kwargs):
        if not self.token or self.is_token_expired():
            # Generate JWT token
            payload = {
                'signer_id': self.id if self.id else None,
                'document_id': self.document.id,
                'email': self.email,
                'exp': timezone.now() + timezone.timedelta(days=30)  # Token expires in 30 days
            }
            self.token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        super().save(*args, **kwargs)

    
    def is_token_expired(self):
        """
        Check if the current token is expired
        Returns True if token is expired or invalid, False otherwise
        """
        if not self.token:
            return True
            
        try:
            # Decode the token without verification first to check expiration
            decoded = jwt.decode(
                self.token,
                settings.SECRET_KEY,
                algorithms=['HS256'],
                options={'verify_exp': True}
            )
            return False
        except jwt.ExpiredSignatureError:
            return True
        except jwt.InvalidTokenError:
            return True

    def get_token_payload(self):
        """
        Get the decoded token payload if token is valid
        Returns None if token is invalid or expired
        """
        if not self.token:
            return None
            
        try:
            return jwt.decode(
                self.token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None

class FormField(BaseModel):
    TYPE_CHOICES = [
        ('signature', 'Signature'),
        ('date', 'Date'),
        ('text', 'Text'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='fields')
    signer = models.ForeignKey(Signer, on_delete=models.CASCADE, related_name='fields')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()
    page = models.PositiveIntegerField()
    required = models.BooleanField(default=True)
    value = models.TextField(blank=True, null=True)
    label = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.type} field on page {self.page}"

class AuditEvent(BaseModel):
    ACTION_CHOICES = [
        ('document_created', 'Document Created'),
        ('document_sent', 'Document Sent'),
        ('document_viewed', 'Document Viewed'),
        ('document_signed', 'Document Signed'),
        ('document_completed', 'Document Completed'),
        ('document_uploaded', 'Document uploaded'),
        ('signer_added','Signer added'),
        ('field_added','Field added')
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='audit_trail')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    email = models.EmailField()
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} - {self.document.title}"
