import glob
import re
from collections import defaultdict

headings = defaultdict(list)

for file in glob.glob('src/**/*.jsx', recursive=True):
    with open(file, 'r') as f:
        content = f.read()
    
    matches = re.findall(r'<(h[1-6])[^>]*className=([\'"]|{`)(.*?)([\'"]|`})', content)
    for tag, _, class_names, _ in matches:
        headings[tag].append((file.split('/')[-1], class_names))

for tag in sorted(headings.keys()):
    print(f'\n--- {tag.upper()} ---')
    unique_classes = list(set([cls for _, cls in headings[tag]]))
    for u in unique_classes[:8]: 
        print(f'Class: {u}')
