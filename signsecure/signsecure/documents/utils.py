from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.urls import reverse
from django.utils.http import urlencode

def send_signing_emails(document):
    """
    Send signing emails to all signers in the document
    Each signer gets their own unique signing link with their token
    """
    base_url = getattr(settings,'FRONTEND_URL','http://localhost:5173')  # e.g., 'http://localhost:3000'
    
    for signer in document.signers.all():
        # Create the signing URL with the signer's token
        # signing_url = f"{base_url}/sign/{document.ref}/{urlencode({'token': signer.token})}"
        signing_url = f"{base_url}/sign/{document.ref}/{signer.token}"
        
        # Prepare email context
        context = {
            'signer_name': signer.name,
            'document_title': document.title,
            'signing_url': signing_url,
            'expiry_days': 30,  # Token expiry in days
        }
        
        # Render email template
        html_message = render_to_string('documents/email/signing_invitation.html', context)
        plain_message = render_to_string('documents/email/signing_invitation.txt', context)
        
        # Send email
        send_mail(
            subject=f'Please sign: {document.title}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[signer.email],
            html_message=html_message,
            fail_silently=False,
        ) 