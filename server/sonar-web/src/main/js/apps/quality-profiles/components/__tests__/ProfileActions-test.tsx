/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProfileActions from '../ProfileActions';
import { click, waitAndUpdate } from '../../../../helpers/testUtils';

const PROFILE = {
  activeRuleCount: 68,
  activeDeprecatedRuleCount: 0,
  childrenCount: 0,
  depth: 0,
  isBuiltIn: false,
  isDefault: false,
  isInherited: false,
  key: 'foo',
  language: 'java',
  languageName: 'Java',
  name: 'Foo',
  organization: 'org',
  rulesUpdatedAt: '2017-06-28T12:58:44+0000'
};

it('renders with no permissions', () => {
  expect(
    shallow(<ProfileActions organization="org" profile={PROFILE} updateProfiles={jest.fn()} />)
  ).toMatchSnapshot();
});

it('renders with permission to edit only', () => {
  expect(
    shallow(
      <ProfileActions
        organization="org"
        profile={{ ...PROFILE, actions: { edit: true } }}
        updateProfiles={jest.fn()}
      />
    )
  ).toMatchSnapshot();
});

it('renders with all permissions', () => {
  expect(
    shallow(
      <ProfileActions
        organization="org"
        profile={{
          ...PROFILE,
          actions: {
            copy: true,
            edit: true,
            delete: true,
            setAsDefault: true,
            associateProjects: true
          }
        }}
        updateProfiles={jest.fn()}
      />
    )
  ).toMatchSnapshot();
});

it('should copy profile', async () => {
  const updateProfiles = jest.fn(() => Promise.resolve());
  const push = jest.fn();
  const wrapper = shallow(
    <ProfileActions
      organization="org"
      profile={{ ...PROFILE, actions: { copy: true } }}
      updateProfiles={updateProfiles}
    />,
    { context: { router: { push } } }
  );

  click(wrapper.find('[id="quality-profile-copy"]'));
  expect(wrapper.find('CopyProfileForm').exists()).toBe(true);

  wrapper.find('CopyProfileForm').prop<Function>('onCopy')('new-name');
  expect(updateProfiles).toBeCalled();
  await waitAndUpdate(wrapper);

  expect(push).toBeCalledWith({
    pathname: '/organizations/org/quality_profiles/show',
    query: { language: 'java', name: 'new-name' }
  });
  expect(wrapper.find('CopyProfileForm').exists()).toBe(false);
});
