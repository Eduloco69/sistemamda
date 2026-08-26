import re

def is_color(hex_string):
    match = re.search(r'^#(?:[0-9a-fA-F]{3}){1,2}$', hex_string)

    if match:                      
        return True

    else:
        return False
