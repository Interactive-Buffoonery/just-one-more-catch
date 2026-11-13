"""Check sourced per-row condition additions without altering other rows."""
import runpy
import sys
import unittest

sys.argv = ['scripts/build_data.py', 'bw']
env = runpy.run_path('scripts/build_data.py', run_name='bw_generator_check')


class RowConditions(unittest.TestCase):
    def test_removal_is_scoped_to_species_method_place_and_version(self):
        game = env['GAME']
        original = game['row_needs']
        condition = 'special-encounter-couldnt-capture-before'
        game['row_needs'] = [{'n': 645, 'place': 'Abundant Shrine', 'm': 'static',
                              'versions': ['black'], 'needs': [],
                              'remove_conditions': [condition], 'exact_place': True}]
        encounters = [{'location_area': {'name': place}, 'version_details': [
            {'version': {'name': v}, 'encounter_details': [
                {'method': {'name': m}, 'condition_values': [{'name': condition}, {'name': 'weekday-friday'}],
                 'chance': 100, 'min_level': 70, 'max_level': 70} for m in ['static', 'walk']
            ]} for v in ['black', 'white']
        ]} for place in ['abundant-shrine-area', 'abundant-shrine-basement']]
        try:
            rows = env['rows_for'](encounters, 'black', 645)
            for row in rows:
                removed = row['place'] == 'Abundant Shrine' and row['m'] == 'static'
                self.assertEqual(condition in row['cond'], not removed)
                self.assertIn('weekday-friday', row['cond'])
            self.assertTrue(all(condition in r['cond'] for r in env['rows_for'](encounters, 'white', 645)))
            self.assertTrue(all(condition in r['cond'] for r in env['rows_for'](encounters, 'black', 644)))
        finally:
            game['row_needs'] = original

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
