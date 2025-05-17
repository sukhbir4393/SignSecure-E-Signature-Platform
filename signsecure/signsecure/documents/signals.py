from django.dispatch import Signal
from django.utils import timezone
from .models import AuditEvent

# Document related signals
document_created = Signal()
document_sent = Signal()
document_viewed = Signal()
document_signed = Signal()
document_completed = Signal()
document_uploaded = Signal()

# Signer related signals
signer_added = Signal()

# Field related signals
field_added = Signal()

def create_audit_event(sender, document, user=None, email=None, action=None, ip_address=None, user_agent=None, **kwargs):
    """
    Generic handler to create audit events
    """
    AuditEvent.objects.create(
        document=document,
        user=user,
        email=email,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        timestamp=timezone.now()
    )

# Connect signals to the handler
document_created.connect(create_audit_event)
document_sent.connect(create_audit_event)
document_viewed.connect(create_audit_event)
document_signed.connect(create_audit_event)
document_completed.connect(create_audit_event)
document_uploaded.connect(create_audit_event)
signer_added.connect(create_audit_event)
field_added.connect(create_audit_event) 