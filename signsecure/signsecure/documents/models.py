from django.db import models
from django.contrib.auth import get_user_model
from core.models import BaseModel
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

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} - {self.document.title}"

class FormField(BaseModel):
    TYPE_CHOICES = [
        ('signature', 'Signature'),
        ('date', 'Date'),
        ('text', 'Text'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='fields')
    signer = models.ForeignKey(Signer, on_delete=models.CASCADE, related_name='fields')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    x = models.IntegerField()
    y = models.IntegerField()
    width = models.IntegerField()
    height = models.IntegerField()
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
