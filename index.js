const { exec } = require('child_process');
const {
  create,
  readFile,
  writeFile,
} = require('./disk');

const FOUR_SPACES = '    ';

const makeNewGoal = (name, description) => {
  return {
    name,
    description,
    resources: [],
  }
}

const findGoal = (goalId, data) => {
  if (Number.isNaN(parseInt(goalId))) {
    return data.find(g => g.name.toLowerCase() === goalId.toLowerCase())
  } else {
    return data[goalId - 1];
  }
}

const isNumber = (string) => {
  return !Number.isNaN(parseInt(string));
}

const NEW_GOAL = 'add-goal';
const REMOVE_GOAL = 'remove-goal';
const ADD_RESOURCE = 'add-resource';
const REMOVE_RESOURCE = 'remove-resource';
const OPEN_RESOURCE = 'open';

const [ pathToNode, pathToExec, command, ...args ] = process.argv;

const rootParts = pathToExec.split('/')
rootParts.pop();
const rootPath = rootParts.join('/');
const recordPath = `${rootPath}/record.json`;

switch(command) {
  case NEW_GOAL: {
    const [ name, description ] = args;
    if (!name || !description) {
      throw new Error('name and goal description required for new goal command')
    }
    readFile(recordPath)
      .then(data => {
        const record = JSON.parse(data);
        const newGoal = makeNewGoal(name, description);
        record.data.push(newGoal);
        writeFile(recordPath, JSON.stringify(record))
      })
      .catch(err => {
        const record = { "data": [] }
        const newGoal = makeNewGoal(name, description);
        record.data.push(newGoal);
        create(recordPath, JSON.stringify(record));
      })
    break;
  }
  case ADD_RESOURCE: {
    const [ goalId, resource ] = args;
    if (!goalId || !resource) {
      throw new Error('goal name/id and resource are required for new resource command')
    }
    readFile(recordPath)
      .then(data => {
        const record = JSON.parse(data);
        const goal = findGoal(goalId, record.data);

        if (!goal) {
          throw new Error('no goal found with provided goal id/name');
        } else {
          goal.resources.push(resource);
          writeFile(recordPath, JSON.stringify(record))
        }
      })
    break;
  }
  case REMOVE_GOAL: {
    const [ goalId ] = args;
    if (!goalId) {
      throw new Error('goal name/id is required for remove goal command')
    }
    readFile(recordPath)
      .then(data => {
        let index;
        const record = JSON.parse(data);
        if (!isNumber(goalId)) {
          index = record.data.findIndex(g => g.name.toLowerCase() === goalId.toLowerCase());
        } else {
          index = parseInt(goalId) - 1;
        }
        record.data.splice(index, 1);
        writeFile(recordPath, JSON.stringify(record))
      })
    break;
  }
  case REMOVE_RESOURCE: {
    const [ goalId, resourceId ] = args;
    if (!goalId || !resourceId) {
      throw new Error('goal name/id and resource id are required for new resource command')
    }
    if (!isNumber(resourceId)) {
      throw new Error('resource id must be a number')
    }
    readFile(recordPath)
      .then(data => {
        const record = JSON.parse(data);
        const goal = findGoal(goalId, record.data);
        const index = parseInt(resourceId) - 1;

        goal.resources.splice(index, 1);

        writeFile(recordPath, JSON.stringify(record))
      })
    break;
  }
  case OPEN_RESOURCE: {
    const [ goalId, resourceId ] = args;
    if (!goalId || !resourceId) {
      throw new Error('goal name/id and resource id are required for new resource command')
    }
    if (!isNumber(resourceId)) {
      throw new Error('resource id must be a number')
    }
    readFile(recordPath)
      .then(data => {
        const record = JSON.parse(data);
        const goal = findGoal(goalId, record.data);
        const index = parseInt(resourceId) - 1;

        const resource = goal.resources[ index ];
        if (!resource) {
          throw new Error(`No resource in goal ${goalId} at index ${resourceId}.`)
        } else {
          exec(`open -a "Google Chrome" ${resource}`)
        }
      })
    break;
  }
  default:
    readFile(recordPath)
      .then(data => {
        const record = JSON.parse(data);

        console.log(`\n${FOUR_SPACES}--GOALS--\n`)

        record.data.forEach((goal, i) => {

          console.log(`${FOUR_SPACES}${i + 1}) ${goal.name}`);
          console.log(`\t ${goal.description}`)

          if (goal.resources.length) {
            console.log(`${FOUR_SPACES}  Resources:`)
          }

          goal.resources.forEach((resource, l) => {
            console.log(`  \t${l + 1}. ${resource}`)
          })
        })
        console.log('')
      })
}
