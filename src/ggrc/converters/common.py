import re
from ggrc.app import db
from pprint import pprint
from copy import *

# Temporary as I test new import functionality
DEBUG_IMPORT = True

def prepare_slug(slug):
  return re.sub(r'\r|\n'," ", slug.strip()).upper()

class ImportException(Exception):
  def __init__(self, message):
    print "CREATION OF EXCEPTION!"
    self.message = message

  def __str__(self):
    return self.message if self.message else "Could not import: verify the file is correctly formatted."