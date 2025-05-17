from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from signsecure.users.api.views import UserViewSet
from signsecure.documents.urls import urlpatterns as document_urlpatterns
router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)


app_name = "api"
urlpatterns = router.urls
urlpatterns = urlpatterns + document_urlpatterns