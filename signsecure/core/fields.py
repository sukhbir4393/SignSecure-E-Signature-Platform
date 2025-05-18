import datetime
import os
import uuid

import pytz
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.db.models.fields.related import ReverseOneToOneDescriptor
from django.utils.deconstruct import deconstructible
from django.utils.encoding import smart_str
from django.utils.translation import gettext as _
from rest_framework import serializers
from rest_framework.fields import SkipField


@deconstructible
class UploadTo(object):
    def __init__(self, sub_path):
        self.path = sub_path

    def __call__(self, instance, filename):
        unique_path = str(uuid.uuid4())
        return os.path.join(self.path, unique_path, os.path.basename(filename))


class ProtectedForeignKey(models.ForeignKey):
    def __init__(self, *args, **kwargs):
        kwargs["on_delete"] = models.PROTECT
        super(ProtectedForeignKey, self).__init__(*args, **kwargs)


class SingleRelatedObjectDescriptorReturnsNone(ReverseOneToOneDescriptor):
    def __get__(self, instance, cls=None):
        try:
            return super(SingleRelatedObjectDescriptorReturnsNone, self).__get__(
                instance=instance, cls=cls
            )
        except ObjectDoesNotExist:
            return None


class OneToOneOrNoneField(models.OneToOneField):
    """A OneToOneField that returns None if the related object doesn't exist"""

    related_accessor_class = SingleRelatedObjectDescriptorReturnsNone

    def __init__(self, *args, **kwargs):
        kwargs["on_delete"] = models.SET_NULL
        kwargs["null"] = True
        super(OneToOneOrNoneField, self).__init__(*args, **kwargs)


class UUIDRelatedField(serializers.RelatedField):
    """
    A read-write field that represents the target of the relationship
    by a unique 'slug' attribute.n
    """

    default_error_messages = {
        "does_not_exist": "Object with ref={value} does not exist.",
        "invalid": "Invalid value.",
    }

    def to_internal_value(self, data):
        try:
            if hasattr(data, "ref"):
                # Solves a problem where a double-validation happens when processing nested serializers
                data = data.ref
            return self.get_queryset().get(**{"ref": data})
        except ObjectDoesNotExist:
            self.fail("does_not_exist", value=smart_str(data))
        except (TypeError, ValueError):
            self.fail("invalid")

    def to_representation(self, obj):
        return str(obj.ref)


class PrimaryRefField(serializers.CharField):
    def __init__(self, *args, **kwagrs):
        super().__init__(
            source="ref",
            required=False,
            allow_null=True,
            allow_blank=True,
            *args,
            **kwagrs,
        )

    def get_value(self, data):
        # This is a mess, trying to resolve problems with nested objects not passing through their refs when saving.
        # See in particular AdminAddressSerializer
        return data.get("id", data.get("ref", None))

    def run_validation(self, value):
        if value is None:
            raise SkipField()
        return value


class FloatFieldSupportingEmptyString(serializers.FloatField):
    def to_internal_value(self, data):
        if not data:
            return None
        return super().to_internal_value(data)


class NormalizedDateTimeField(serializers.DateTimeField):
    def __init__(self, source, *args, **kwargs):
        date_format = settings.NORMALIZED_DATE_TIME_FORMAT
        super(NormalizedDateTimeField, self).__init__(
            format=date_format,
            source=source,
            required=False,
            read_only=True,
            *args,
            **kwargs,
        )


class DayOfTheWeekField(models.CharField):
    DAY_OF_THE_WEEK = {
        "1": _("Monday"),
        "2": _("Tuesday"),
        "3": _("Wednesday"),
        "4": _("Thursday"),
        "5": _("Friday"),
        "6": _("Saturday"),
        "7": _("Sunday"),
    }

    def __init__(self, *args, **kwargs):
        kwargs["choices"] = tuple(sorted(self.DAY_OF_THE_WEEK.items()))
        kwargs["max_length"] = 1
        super(DayOfTheWeekField, self).__init__(*args, **kwargs)


class TimezoneField(models.CharField):
    def __init__(self, *args, **kwargs):

        kwargs["choices"] = tuple(
            [
                (
                    timezone,
                    f"{timezone} {datetime.datetime.now(pytz.timezone(timezone)).strftime('%z')}",
                )
                for timezone in pytz.all_timezones
            ]
        )
        kwargs["max_length"] = 100
        super(TimezoneField, self).__init__(*args, **kwargs)
