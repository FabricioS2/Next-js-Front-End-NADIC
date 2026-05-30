from rest_framework import serializers
from .models import User, Artigo

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nome', 'email', 'instituicao', 'categoria', 'pais', 'telefone', 'role', 'dataCriacao']
        read_only_fields = ['id', 'role', 'dataCriacao']

class UserCreateSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['nome', 'email', 'senha', 'instituicao', 'categoria', 'pais', 'telefone']

    def create(self, validated_data):
        senha = validated_data.pop('senha')
        user = User.objects.create_user(**validated_data, password=senha)
        return user

class ArtigoSerializer(serializers.ModelSerializer):
    autorNome = serializers.CharField(source='autor.nome', read_only=True)

    class Meta:
        model = Artigo
        fields = ['id', 'titulo', 'autor', 'autorNome', 'area', 'dataSubmissao', 'resumo', 'palavrasChave', 'arquivo']
        read_only_fields = ['autor', 'dataSubmissao']