import csv
import hashlib
import random
import string



def generate_code(length=6):
    return ''.join(random.choices(string.digits, k=length))
