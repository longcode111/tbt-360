"""Kiểm tra cấu trúc dự án không cần npm / .NET SDK / Docker."""

import json
import pathlib
import re
import unittest
import zipfile

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[1]


class RepositoryStructureTests(unittest.TestCase):
    def test_react_dependencies_are_declared(self):
        package = json.loads(
            (PROJECT_ROOT / 'frontend/package.json').read_text()
        )
        self.assertIn('react', package['dependencies'])
        self.assertIn('oidc-client-ts', package['dependencies'])
        self.assertIn('typescript', package['devDependencies'])

    def test_dotnet_and_postgres_are_connected_by_ef_core(self):
        project = (
            PROJECT_ROOT / 'backend/Tbt360.Api/Tbt360.Api.csproj'
        ).read_text()
        program = (
            PROJECT_ROOT / 'backend/Tbt360.Api/Program.cs'
        ).read_text()
        self.assertIn('<TargetFramework>net10.0', project)
        self.assertIn('Npgsql.EntityFrameworkCore.PostgreSQL', project)
        self.assertIn('UseNpgsql(connectionString)', program)

    def test_admin_endpoints_require_server_side_authorization(self):
        code = (
            PROJECT_ROOT / 'backend/Tbt360.Api/Endpoints/AdminEndpoints.cs'
        ).read_text()
        self.assertIn('.RequireAuthorization("AdminOnly")', code)
        program = (
            PROJECT_ROOT / 'backend/Tbt360.Api/Program.cs'
        ).read_text()
        self.assertIn('ValidateAudience = true', program)
        self.assertIn('ValidateIssuer = true', program)
        self.assertIn('RequireSignedTokens = true', program)

    def test_oidc_uses_code_and_pkce(self):
        code = (PROJECT_ROOT / 'frontend/src/lib/auth.ts').read_text()
        self.assertIn("response_type: 'code'", code)
        realm = json.loads(
            (PROJECT_ROOT / 'infra/keycloak/tbt-360-realm.json').read_text()
        )
        client = realm['clients'][0]
        self.assertEqual(client['publicClient'], True)
        self.assertEqual(client['attributes']['pkce.code.challenge.method'], 'S256')
        self.assertEqual(client['directAccessGrantsEnabled'], False)

    def test_local_assets_and_seeded_banner_names_match(self):
        assets = PROJECT_ROOT / 'frontend/public/banners'
        source = (
            PROJECT_ROOT / 'backend/Tbt360.Api/Data/DatabaseSeeder.cs'
        ).read_text()

        for name in [
            'bim-cde-360.png',
            'nghiem-thu-do.png',
            'nghiem-thu-xanh.png',
        ]:
            self.assertTrue((assets / name).is_file())
            self.assertIn(name, source)

    def test_github_secrets_excluded(self):
        ignore = (PROJECT_ROOT / '.gitignore').read_text()
        self.assertIn('.env', ignore)
        self.assertIn('node_modules', ignore)
        self.assertFalse((PROJECT_ROOT / '.env').exists())
        settings = json.loads(
            (PROJECT_ROOT / 'backend/Tbt360.Api/appsettings.json').read_text()
        )
        self.assertNotIn('Password=', settings['ConnectionStrings']['Postgres'])

    def test_react_admin_routes_match_backend_api(self):
        admin_ui = (
            PROJECT_ROOT / 'frontend/src/components/AdminPanel.tsx'
        ).read_text()
        admin_backend = (
            PROJECT_ROOT / 'backend/Tbt360.Api/Endpoints/AdminEndpoints.cs'
        ).read_text()
        for section in [
            'products', 'articles', 'banners', 'orders', 'contacts', 'settings',
        ]:
            self.assertIn(section, admin_ui)
            self.assertIn(f'/{section}', admin_backend)


if __name__ == '__main__':
    unittest.main(verbosity=2)
