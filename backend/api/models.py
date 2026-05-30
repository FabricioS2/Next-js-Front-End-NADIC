from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    nome = models.CharField(max_length=255)
    instituicao = models.CharField(max_length=255, blank=True, null=True)
    categoria = models.CharField(
        max_length=20,
        choices=[
            ('pesquisador', 'Pesquisador(a)'),
            ('estudante', 'Estudante de Pós-Graduação'),
            ('graduacao', 'Estudante de Graduação'),
            ('profissional', 'Profissional da Área'),
        ]
    )
    pais = models.CharField(max_length=100, default='Brasil')
    telefone = models.CharField(max_length=30, blank=True, null=True)
    role = models.CharField(max_length=10, choices=[('user', 'user'), ('admin', 'admin')], default='user')
    dataCriacao = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    objects = UserManager()

    def __str__(self):
        return self.nome

class Artigo(models.Model):
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='artigos')
    titulo = models.CharField(max_length=255)
    resumo = models.TextField()
    palavrasChave = models.CharField(max_length=255, blank=True, null=True)
    area = models.CharField(
        max_length=30,
        choices=[
            ('biologia', 'Biologia Marinha'),
            ('ecologia', 'Ecologia de Recifes'),
            ('clima', 'Mudanças Climáticas'),
            ('conservacao', 'Conservação'),
        ]
    )
    arquivo = models.FileField(upload_to='artigos/', blank=True, null=True)
    dataSubmissao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo