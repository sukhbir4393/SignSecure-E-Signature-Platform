from django.contrib import admin
from .models import Document,Signer,FormField,AuditEvent
# Register your models here.

admin.site.register(Document)
admin.site.register(Signer)
admin.site.register(FormField)
admin.site.register(AuditEvent)