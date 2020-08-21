const { pageTablesToDataArray } = require('./chartToArrayBuilder');
const {startChart5Predicate} = require('./chartFive');

// this function look for the correct columns for the given headers, and returns a factory embedded with these findings
const rowAbstractFactory = (firstPageOfTable, headersStartIndex) => {
    // firstPageOfTable should be table with 2 columns
    // the column of the clause should be the one that has "4.1" in it.

    const getFromArr = (arr, index) => {
        return index === undefined || index === -1 ? undefined : arr[index];
    };

    //clean the headers
    firstPageOfTable = firstPageOfTable.map(row => row.map(cell => cell.replace(/\n/g, ' ')
        .replace(/ {2}/g, ' ')
        .trim()));

    if (headersStartIndex === -1) {
        console.log("didn't find headers");
        return (row => {});
    }

    const header = firstPageOfTable[headersStartIndex];

    const clauseNumberIndex = header.findIndex(title => title === '4.1');
    if(clauseNumberIndex === -1) {
        // the data is a mess. There are some pdfs that are a mess... We can't distinguish the description from the
        // clause number in that case
        return (row) => {
            return {
                clause_number: undefined,
                // the description is in the column that it's header is not empty
                description: getFromArr(row, header.findIndex(cell => cell !== ''))
            };
        };
    }
    //description is the other column
    const descriptionIndex = clauseNumberIndex === 0 ? 1 : 0;

    return (row) => {
        return {
            clause_number: getFromArr(row, clauseNumberIndex),
            description: getFromArr(row, descriptionIndex)
        };
    };
};

const startChart4Predicate = (cell) => {
    return cell === 'יעודי קרקע ושימושים4.';
};



const extractChartFour = (pageTables) => {
    return pageTablesToDataArray({pageTables,
        rowAbstractFactory,
        startOfChartPred: startChart4Predicate,
        offsetOfRowWithDataInChart: 0,  //the header is data too
        chartDonePredicate: (row) => row.some(cell => startChart5Predicate(cell)),   // chart 4 is ending when chart 5 is starting
        // table 4 will always start in a new page and it has no actual header beyond the title
        getHeaderRowIndex: (page, searchFrom) => {
            // these two cases (the if and the else) could have been merged, but the code on the else is more specific
            // for the case of the first page
            if (searchFrom === 0) {
                // not the first page
                return page.findIndex(row => row.some(cell => /^\d.\d/.exec(cell) !== null));
            }
            else {
                // the first page
                const ind = page.findIndex(row => row.some(cell => startChart4Predicate(cell)));
                return ind === -1 ? -1 : ind + 2;
            }

        },
        identifier: 'chart 4'
    });
};

// the input is chart 4 from the parser, the output is processed and grouped chart 4
const processChartFour = (chartFour) => {
    const processedChartFour = [];
    let father_cat = '';
    let father_cat_number = '';
    let curr_cat = '';
    let curr_cat_number = '';

    for (let i = 0; i < chartFour.length; i++) {
        const clause_num = chartFour[i].clause_number;
        const description = chartFour[i].description;

        // it's something like 4.1 or 4.3 (number dot number)
        const father_cat_match = /^\d\.\d$/.exec(clause_num);
        const father_cat_match_backup = /(?<!\.)\d\.\d(?!\.)/.exec(description);
        if (father_cat_match !== null || (!clause_num && father_cat_match_backup !== null)) {
            // it's a father category, but it's not saying anything, yet. we save it for later.
            if (clause_num !== '' && clause_num !== undefined) {
                father_cat = description;
                father_cat_number = clause_num;
            }
            else {
                // the data is a mess - we will extract the description and the clause_num
                father_cat = description.replace(father_cat_match_backup[0], '');
                father_cat_number = father_cat_match_backup[0];
            }
        }

        else {
            // it's somehting like 4.1.1 or 4.3.2 (number dot number dot number)
            const curr_cat_match = /^\d\.\d\.\d$/.exec(clause_num);
            const curr_cat_match_backup = /(?<!\.)\d\.\d\.\d(?!\.)/.exec(description);
            if (curr_cat_match !== null || (!clause_num && curr_cat_match_backup !== null)) {
                if (clause_num !== '' && clause_num !== undefined) {
                    curr_cat = description;
                    curr_cat_number = clause_num;
                }
                else {
                    // the data is a mess - we will extract the description and the clause_num
                    curr_cat = description.replace(curr_cat_match_backup[0], '');
                    curr_cat_number = curr_cat_match_backup[0];
                }
            }

            // it's not defining a category, it's actual data
            else {
                // it doesn't have a category. If the category wasn't changed, we should push this data to the previous row
                if (clause_num === '' &&
                    processedChartFour.length > 0 &&
                    processedChartFour[processedChartFour.length - 1].category === curr_cat &&
                    processedChartFour[processedChartFour.length - 1].father_category === father_cat) {
                    // add the current description to the previous entry with a newline
                    processedChartFour[processedChartFour.length - 1].text += '\n' + description;
                }
                else {
                    const processedRow = {
                        father_category: father_cat,
                        father_category_number: father_cat_number,
                        category: curr_cat,
                        category_number: curr_cat_number,
                        text: description
                    };
                    processedChartFour.push(processedRow);
                }
            }
        }
    }
    return processedChartFour;
};

module.exports = {
    extractChartFour,
    processChartFour
};