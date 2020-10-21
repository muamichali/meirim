const assert = require('chai').assert;
const { mockDatabase } = require('../../mock');

const tables = ['plan', 'notification', 'alert', 'person'];

describe.skip('Crawler', function() {
	let planController;
	let cronController;

	let plans;

	beforeEach(async function() {
		await mockDatabase.dropTables(tables);
		await mockDatabase.createTables(tables);
		planController = require('../../../api/controller/plan');
		cronController = require('../../../api/controller/cron');
	});

	afterEach(async function() {
		await mockDatabase.dropTables(tables);
	});

	it('should run', async function() {
		this.timeout(60000);

		// make sure there are currently no plans in the database
		plans = await planController.browse({query: {status: null, query: null}});
		assert.equal(plans.length, 0);

		// run crawler cron with limit of 2 plans
		await cronController.iplan(1);

		// now there should be 2 plans (with mavat data?)
		plans = await planController.browse({query: {status: null, query: null}});
		assert.equal(plans.length, 1);
	});
});