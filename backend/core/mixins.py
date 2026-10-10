from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.response import Response


class ProtectedDestroyMixin:
    """Turn a PROTECT foreign-key failure on delete into a 409 with a readable message."""

    protected_message = "This record is still in use, so it can't be deleted."

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({"error": self.protected_message}, status=status.HTTP_409_CONFLICT)
