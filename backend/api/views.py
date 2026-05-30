from django.shortcuts import render

# Create your views here.
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Artigo
from .serializers import UserSerializer, UserCreateSerializer, ArtigoSerializer
from .permissions import IsAdminUserCustom

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

class InscricaoCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

class ArtigoListCreateView(generics.ListCreateAPIView):
    serializer_class = ArtigoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Usuário comum vê seus próprios artigos; admin pode ver todos, mas nesse endpoint específico
        # (admin usa os endpoints de admin para ver tudo)
        if user.role == 'admin':
            return Artigo.objects.filter(autor=user)
        return Artigo.objects.filter(autor=user)

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)

class AdminInscricoesListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserCustom]

    def get_queryset(self):
        # Retorna apenas usuários com role='user' (não admins)
        return User.objects.filter(role='user')

class AdminArtigosListView(generics.ListAPIView):
    serializer_class = ArtigoSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserCustom]

    def get_queryset(self):
        return Artigo.objects.all()

class AdminClearDataView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserCustom]

    def delete(self, request):
        # Deleta todos os artigos e usuários comuns
        Artigo.objects.all().delete()
        User.objects.filter(role='user').delete()
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)