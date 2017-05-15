nppm (WIP)
====

[![Greenkeeper badge](https://badges.greenkeeper.io/matteofigus/nppm.svg)](https://greenkeeper.io/)
Install and require multiple versions of npm modules

#### Install
```sh
# npm i [-g] nppm
```

#### Programmatic usage

```js
const nppm = require('nppm')

const dependencies = ['lodash@1', 'lodash@2.3.4']
const path = './nppm_node_modules'

nppm.install({ dependencies, path }, (err, result) => {
	console.log(result);
	// => [{ name: 'lodash', requestedVersion: '1', version: '1.2.3', path: '...'}, ...]
})
...
nppm.init({ path }, (err) => {
	const lodash = nppm.require('lodash@~2.3.1')
})
```

#### CLI usage

```sh
npm i -g nppm
nppm i --path=./nppm_node_modules lodash@1 lodash@2.3.4

# or
echo '{"dependencies":["lodash@1","lodash@1.2.3"],"path":"./nppm_node_modules"}' >> nppm.json
nppm i [--config=nppm.json]
```

#### License
MIT