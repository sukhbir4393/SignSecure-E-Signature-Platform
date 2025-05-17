from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentViewSet, SignerViewSet,
    FormFieldViewSet, AuditEventViewSet
)

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'signers', SignerViewSet, basename='signer')
router.register(r'fields', FormFieldViewSet, basename='field')
router.register(r'audit-trail', AuditEventViewSet, basename='audit')

urlpatterns = [
    path('', include(router.urls)),
] 