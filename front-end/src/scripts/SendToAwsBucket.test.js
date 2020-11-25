// Import script to test
import {sendToAwsBucket} from './SendToAwsBucket';

test('Upload image', () => 
{
	expect(sendToAwsBucket().not.stringContaining('FAILED'));
});
