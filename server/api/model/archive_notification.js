const Model = require('./base_model');
const Exception = require('./exception');

class ArchiveNotification extends Model {

	get rules() {
		return {
			person_id: ['required', 'integer'],
			plan_id: ['required', 'integer'],
			seen: 'boolean',
			type: ['required', 'string']
		};
	}	

	get tableName() {
		return 'archive_notification';
	}

	get hasTimestamps() {
		return true;
	}

	defaults() {
		return {
			seen: false 
		};
	}

	static canCreate(session) {
		if (!session.person) {
			throw new Exception.NotAllowed('Must be logged in');
		}
		return Promise.resolve(this);
	}
}

module.exports = ArchiveNotification;
