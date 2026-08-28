import re
def password_check(pwd):
    reg = r'^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?{}|<>]).{6,12}$'

    pat = re.compile(reg)

    mat = re.search(pat, pwd)

    if mat:
        return True
    else:
        return False