"""Kiểm tra tích hợp Tailwind vào React mà không cần cài Node packages."""

import pathlib
import re
import unittest


PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[1]
FRONTEND_ROOT = PROJECT_ROOT / 'frontend'
SOURCE_ROOT = FRONTEND_ROOT / 'src'


class TailwindMigrationTests(unittest.TestCase):
    def test_tailwind_vite_plugin_and_dependency_are_configured(self):
        import json

        package = json.loads((FRONTEND_ROOT / 'package.json').read_text())
        vite_config = (FRONTEND_ROOT / 'vite.config.ts').read_text()
        self.assertIn('tailwindcss', package['devDependencies'])
        self.assertIn('@tailwindcss/vite', package['devDependencies'])
        self.assertIn('tailwindcss()', vite_config)

    def test_legacy_stylesheet_is_replaced(self):
        entry_point = (SOURCE_ROOT / 'main.tsx').read_text()
        tailwind_css = (SOURCE_ROOT / 'tailwind.css').read_text()
        self.assertFalse((SOURCE_ROOT / 'styles.css').exists())
        self.assertIn("import './tailwind.css'", entry_point)
        self.assertIn("@import 'tailwindcss'", tailwind_css)
        self.assertIn('--primary: #bd1722;', tailwind_css)

    def test_all_literal_style_names_are_defined(self):
        styles = (SOURCE_ROOT / 'lib/uiStyles.ts').read_text()
        style_names = set(re.findall(r'^  (\w+): ', styles, flags=re.M))

        for component_path in SOURCE_ROOT.rglob('*.tsx'):
            component_code = component_path.read_text()
            self.assertNotIn('styles.css', component_code)
            self.assertNotIn('className="', component_code)

            for style_call in re.findall(
                r'classNames\((.*?)\)', component_code, flags=re.S
            ):
                for style_name in re.findall(
                    r"'([A-Za-z]\w*)'", style_call
                ):
                    if style_name == 'color':
                        continue
                    self.assertIn(
                        style_name,
                        style_names,
                        f'{component_path}: unknown Tailwind style {style_name}',
                    )

        self.assertIn('primaryButton', style_names)
        self.assertIn('adminLayout', style_names)
        self.assertIn('bannerCarousel', style_names)

    def test_brand_color_uses_admin_css_variable(self):
        styles = (SOURCE_ROOT / 'lib/uiStyles.ts').read_text()
        app = (SOURCE_ROOT / 'App.tsx').read_text()
        self.assertIn('var(--primary)', styles)
        self.assertIn("'--primary'", app)

    def test_existing_banner_assets_are_unchanged(self):
        for image_name in (
            'bim-cde-360.png',
            'nghiem-thu-do.png',
            'nghiem-thu-xanh.png',
        ):
            self.assertTrue((FRONTEND_ROOT / 'public/banners' / image_name).is_file())


if __name__ == '__main__':
    unittest.main(verbosity=2)
