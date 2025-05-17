import uuid
from datetime import datetime

from . import apidate
from django.db import models
from django.forms.models import model_to_dict as _model_to_dict
from django.utils import timezone


def model_to_dict_with_date_support(m):
    d = _model_to_dict(m)
    for k, v in d.items():
        if isinstance(v, datetime):
            v = apidate.convert_datetime_to_iso_string(v)
    return d


class BaseManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class BaseDeletedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=False)


class BaseModel(models.Model):
    class Meta:
        abstract = True
        default_permissions = ["add", "change", "delete", "view"]

    created_at = models.DateTimeField(editable=False, auto_now_add=True)
    modified_at = models.DateTimeField(editable=False, auto_now=True)
    ref = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    deleted_at = models.DateTimeField(null=True, default=None, blank=True)

    objects = BaseManager()
    objects_original = models.Manager()
    all_objects = models.Manager()
    objects_deleted = BaseDeletedManager()

    def model_to_dict(self):
        return model_to_dict_with_date_support(self)

    def short_ref(self):
        return str(self.ref).split("-")[0]

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.deleted_at = None
        self.save()

    # def history(self):
    #     return Version.objects.get_for_object(self)
