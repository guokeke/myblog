import {
  getUserById, createUser, deleteUserForever,
  ERR_EMAIL_ALREADY_EXISTS } from '../utils/userUtils';
// import { setUserGroup, createGroup } from '../utils/groupUtils';
import { ERR_TASK_FAILED } from './constants';

const EMAIL = 'test@test.com';
const USERNAME = 'test';
const PASSWORD = 'test';

function createTestUser() {
  return createUser({
    email: EMAIL,
    username: USERNAME,
    password: PASSWORD,
  });
}

describe('User utils test: ', () => {

  it('should create a user', async () => {
    let testUser;
    try {
      testUser = await createTestUser();
      const theUser = await getUserById(testUser.get('id'));
      if (!theUser) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) {
        await deleteUserForever(testUser);
      }
    }
  });

  it(`should username equal to ${USERNAME}`, async () => {
    let testUser;
    try {
      testUser = await createTestUser();
      if (testUser.username !== USERNAME) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) {
        await deleteUserForever(testUser);
      }
    }
  });

  it('should throw a email exist err', async () => {
    let testUser;
    try {
      testUser = await createTestUser();
      await createUser({
        email: 'test@test.com',
        password: 'test',
      });
    } catch (err) {
      if (err !== ERR_EMAIL_ALREADY_EXISTS) throw err;
    } finally {
      if (testUser) {
        await deleteUserForever(testUser);
      }
    }
  });

  it('should set test user to test group', async () => {
    let testUser;
    let userGroups;
    try {
      testUser = await createTestUser();
      userGroups = await testUser.getGroups();
      if (userGroups[0].name !== 'test') {
        throw ERR_TASK_FAILED;
      }
    } catch (err) {
      throw err;
    } finally {
      if (testUser) {
        await deleteUserForever(testUser);
      }
    }
  });

});
