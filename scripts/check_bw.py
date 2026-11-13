"""Check sourced per-row condition additions without altering other rows."""
import runpy
import sys
import unittest

sys.argv = ['scripts/build_data.py', 'bw']
env = runpy.run_path('scripts/build_data.py', run_name='bw_generator_check')


class RowConditions(unittest.TestCase):
    def test_condition_is_scoped_to_species_method_place_and_version(self):
        game = env['GAME']
        original = game['row_needs']
        game['row_needs'] = [{'n': 518, 'place': 'Dreamyard B1F', 'm': 'static',
                              'versions': ['black'], 'needs': [], 'conditions': ['weekday-friday']}]
        encounters = [{'location_area': {'name': 'dreamyard-b1f'}, 'version_details': [
            {'version': {'name': v}, 'encounter_details': [
                {'method': {'name': m}, 'condition_values': [], 'chance': 100,
                 'min_level': 50, 'max_level': 50} for m in ['static', 'walk']
            ]} for v in ['black', 'white']
        ]}]
        try:
            rows = env['rows_for'](encounters, 'black', 518)
            self.assertEqual(next(r for r in rows if r['m'] == 'static')['cond'], ['weekday-friday'])
            self.assertEqual(next(r for r in rows if r['m'] == 'walk')['cond'], [])
            self.assertTrue(all(not r['cond'] for r in env['rows_for'](encounters, 'white', 518)))
            self.assertTrue(all(not r['cond'] for r in env['rows_for'](encounters, 'black', 517)))
        finally:
            game['row_needs'] = original


if __name__ == '__main__':
    unittest.main(argv=[sys.argv[0]])
