from rest_framework import serializers

from signsecure.users.models import User


class UserSerializer(serializers.ModelSerializer[User]):
    role = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ["id","name", "email","role","created_at"]

        # extra_kwargs = {
        #     "url": {"view_name": "api:user-detail", "lookup_field": "pk"},
        # }
    def get_role(self,instance,*args,**kwargs):
        return ''
