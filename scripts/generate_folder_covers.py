import os
import json
from pathlib import Path
from jinja2 import Template
import shutil
from PIL import Image, ImageDraw, ImageFont
import cairosvg
import webbrowser
import tempfile
import time

class FolderCoverGenerator:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.colors = {
            'tech_blue': '#2B7BE9',
            'zen_gray': '#E5E7EB',
            'deep_mind_purple': '#6B46C1',
            'meditation_white': '#FFFFFF',
            'circuit_black': '#1A1A1A',
            'mindful_teal': '#2DD4BF',
            'focus_amber': '#F59E0B',
            'growth_emerald': '#10B981'
        }
        
        # Directory type color mappings with variations for subdirectories
        self.dir_colors = {
            'assets': {
                'main': ('tech_blue', 'deep_mind_purple'),
                'sub': {
                    'images': ('mindful_teal', 'tech_blue'),
                    'logos': ('deep_mind_purple', 'tech_blue'),
                    'fonts': ('tech_blue', 'zen_gray')
                }
            },
            'branding': {
                'main': ('deep_mind_purple', 'tech_blue'),
                'sub': {
                    'guidelines': ('deep_mind_purple', 'mindful_teal'),
                    'logos': ('tech_blue', 'deep_mind_purple'),
                    'colors': ('focus_amber', 'deep_mind_purple')
                }
            },
            'clients': {
                'main': ('tech_blue', 'zen_gray'),
                'sub': {}  # Dynamic subdirectories
            },
            'docs': {
                'main': ('zen_gray', 'tech_blue'),
                'sub': {
                    'contracts': ('tech_blue', 'mindful_teal'),
                    'proposals': ('deep_mind_purple', 'tech_blue'),
                    'invoices': ('growth_emerald', 'tech_blue')
                }
            },
            'marketing': {
                'main': ('deep_mind_purple', 'zen_gray'),
                'sub': {
                    'campaigns': ('focus_amber', 'deep_mind_purple'),
                    'content': ('mindful_teal', 'deep_mind_purple'),
                    'social-media': ('tech_blue', 'deep_mind_purple')
                }
            },
            'projects': {
                'main': ('tech_blue', 'deep_mind_purple'),
                'sub': {
                    'active': ('growth_emerald', 'tech_blue'),
                    'completed': ('deep_mind_purple', 'tech_blue'),
                    'pipeline': ('focus_amber', 'tech_blue')
                }
            },
            'services': {
                'main': ('deep_mind_purple', 'tech_blue'),
                'sub': {
                    'descriptions': ('mindful_teal', 'deep_mind_purple'),
                    'pricing': ('focus_amber', 'deep_mind_purple'),
                    'portfolio': ('tech_blue', 'deep_mind_purple')
                }
            },
            'website': {
                'main': ('tech_blue', 'zen_gray'),
                'sub': {
                    'public': ('tech_blue', 'mindful_teal'),
                    'src': ('deep_mind_purple', 'tech_blue'),
                    'content': ('mindful_teal', 'tech_blue')
                }
            }
        }

    def load_template(self):
        template_path = self.root_dir / 'assets' / 'templates' / 'folder_cover_template.html'
        with open(template_path, 'r') as f:
            return Template(f.read())

    def get_directory_info(self, dir_path):
        """Get directory name and description based on path"""
        dir_name = dir_path.name
        parent_name = dir_path.parent.name.lower()
        
        descriptions = {
            'assets': {
                'main': 'Media and resource files',
                'images': 'Visual assets and graphics',
                'logos': 'Logo variations and formats',
                'fonts': 'Typography and font files'
            },
            'branding': {
                'main': 'Brand identity and guidelines',
                'guidelines': 'Brand usage and standards',
                'logos': 'Official logo assets',
                'colors': 'Color palette and schemes'
            },
            'docs': {
                'main': 'Documentation and contracts',
                'contracts': 'Legal agreements and contracts',
                'proposals': 'Project and service proposals',
                'invoices': 'Billing and payment records'
            },
            # Add more descriptions as needed
        }
        
        if parent_name in descriptions and dir_name.lower() in descriptions[parent_name]:
            return dir_name.title(), descriptions[parent_name][dir_name.lower()]
        elif dir_name.lower() in descriptions:
            return dir_name.title(), descriptions[dir_name.lower()]['main']
        return dir_name.title(), ''

    def get_color_scheme(self, dir_path):
        """Get color scheme based on directory path"""
        dir_name = dir_path.name.lower()
        parent_name = dir_path.parent.name.lower()
        
        if parent_name in self.dir_colors:
            if dir_name in self.dir_colors[parent_name]['sub']:
                return self.dir_colors[parent_name]['sub'][dir_name]
        
        if dir_name in self.dir_colors:
            return self.dir_colors[dir_name]['main']
            
        return ('tech_blue', 'deep_mind_purple')  # Default colors

    def preview_cover(self, html_content):
        """Preview the folder cover in a web browser"""
        with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False) as f:
            f.write(html_content)
            temp_path = f.name
        
        webbrowser.open(f'file://{temp_path}')
        time.sleep(2)  # Give browser time to load
        os.unlink(temp_path)

    def generate_cover(self, dir_path, output_path, preview=False):
        """Generate a folder cover for the specified directory"""
        dir_name, description = self.get_directory_info(dir_path)
        primary_color, secondary_color = self.get_color_scheme(dir_path)

        # Create cover HTML
        template = self.load_template()
        html_content = template.render(
            folder_name=dir_name,
            folder_description=description,
            primary_color=self.colors[primary_color],
            secondary_color=self.colors[secondary_color],
            is_subdirectory=dir_path.parent.name.lower() in self.dir_colors
        )

        if preview:
            self.preview_cover(html_content)
            return

        # Save HTML temporarily
        temp_html = output_path.with_suffix('.html')
        with open(temp_html, 'w') as f:
            f.write(html_content)

        # Convert HTML to PNG
        cairosvg.svg2png(
            url=str(temp_html),
            write_to=str(output_path),
            output_width=256,
            output_height=256
        )

        # Clean up temporary file
        temp_html.unlink()
        print(f'Generated cover for {dir_path.relative_to(self.root_dir)}')

    def generate_all_covers(self, preview_only=False):
        """Generate covers for all directories and subdirectories"""
        covers_dir = self.root_dir / 'assets' / 'folder_covers'
        covers_dir.mkdir(exist_ok=True)

        for main_dir in self.dir_colors.keys():
            main_path = self.root_dir / main_dir
            if main_path.exists():
                if not preview_only:
                    output_path = covers_dir / f'{main_dir}_cover.png'
                    self.generate_cover(main_path, output_path)
                else:
                    self.generate_cover(main_path, None, preview=True)

                # Generate covers for subdirectories
                for subdir in main_path.iterdir():
                    if subdir.is_dir():
                        if not preview_only:
                            output_path = covers_dir / f'{main_dir}_{subdir.name}_cover.png'
                            self.generate_cover(subdir, output_path)
                        else:
                            self.generate_cover(subdir, None, preview=True)

if __name__ == '__main__':
    root_dir = Path('D:/.aGITHUB REPO/mport-media-group')
    generator = FolderCoverGenerator(root_dir)
    
    # Parse command line arguments
    import argparse
    parser = argparse.ArgumentParser(description='Generate folder covers with AI meditation robot theme')
    parser.add_argument('--preview', action='store_true', help='Preview covers in browser without generating files')
    parser.add_argument('--dir', help='Generate cover for specific directory')
    args = parser.parse_args()
    
    if args.dir:
        dir_path = root_dir / args.dir
        if dir_path.exists():
            if args.preview:
                generator.generate_cover(dir_path, None, preview=True)
            else:
                output_path = root_dir / 'assets' / 'folder_covers' / f'{args.dir.replace("/", "_")}_cover.png'
                generator.generate_cover(dir_path, output_path)
    else:
        generator.generate_all_covers(preview_only=args.preview) 