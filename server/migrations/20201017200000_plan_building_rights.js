
exports.up = async function(knex, Promise) {
    await knex.schema.createTableIfNotExists("table_5_building_rights", t => {
        t.increments("id").primary();
        t.integer("plan_id").notNullable().references('id')
            .inTable('plan').onDelete('CASCADE');
        t.string("designation", 1000);
        t.string("use", 1000);
        t.string("area_number", 200);
        t.string("location", 1000);
        t.string("field_size_sqm", 200);  //data is in string form, we can't assume that it will be a nice integer
        t.string("above_primary_main", 200);
        t.string("above_primary_service", 200);
        t.string("below_primary_main", 200);
        t.string("below_primary_service", 200);
        t.string("building_percentage", 200);
        t.string("tahsit", 200);
        t.string("density_yahad_to_dunam", 200);
        t.string("num_of_housing_units", 200);
        t.string("floors_above", 200);
        t.string("floors_below", 200);
        t.string("overall_building_land", 200);
        t.string("height_above_entrance", 200);
        t.string("side_line_right", 200);
        t.string("side_line_left", 200);
        t.string("side_line_back", 200);
        t.string("side_line_front", 200);
    });
    await knex.schema.table('plan', (table) => {
        table.text('explanation');
    })
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('table_5_building_rights');
    await knex.schema.table('plan', table => {
        table.dropColumns('explanation');
    });
};
