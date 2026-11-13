"""Check tile zoom rounding and cap independently of sprite generation."""
from build_form_zoom import zoom_factor

assert zoom_factor(80, 40) == 200
assert zoom_factor(96, 67) == 143
assert zoom_factor(80, 10) == 250
assert zoom_factor(80, 80) == 100
print('form zoom: 4 checks passed')
