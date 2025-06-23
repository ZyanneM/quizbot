import toml

# Chemin vers ton fichier pyproject.toml
pyproject_path = "pyproject.toml"
requirements_path = "requirements.txt"

# Charger le contenu du fichier
with open(pyproject_path, "r") as f:
    pyproject = toml.load(f)

# Extraire les dépendances
dependencies = pyproject["tool"]["poetry"]["dependencies"]

# Supprimer Python lui-même
dependencies.pop("python", None)

# Convertir en format requirements.txt
lines = [f"{package}{version if isinstance(version, str) else ''}"
         for package, version in dependencies.items()]

# Écrire dans requirements.txt
with open(requirements_path, "w") as f:
    f.write("\n".join(lines))

print(f"✅ Fichier requirements.txt généré ({len(lines)} dépendances)")
