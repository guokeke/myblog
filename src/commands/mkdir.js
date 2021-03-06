import appState from '../core/state';
import api from '../core/api';

export default {

  name: 'mkdir',

  help: 'Create a folder',

  test: /^\s*mkdir.*$/,

  action(command) {
    return new Promise(async (resolve, reject) => {
      try {
        const inputs = command.match(/-?([^\x00-\xff]+|\w+)+/gm);
        const options = [];
        const params = [];

        for (let i = 1; i < inputs.length; i += 1) {
          if (inputs[i].charAt(0) === '-') {
            options.push(inputs[i]);
          } else {
            params.push(inputs[i]);
          }
        }

        const path = appState.getPath();
        const name = params[0];

        await api('/graphql', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              mutation{
                mkdir(path:"${path}", name: "${name}") {
                  name, error
                }
              }
            `,
          }),
        });

        // if need create a new line then pass true
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },
};
