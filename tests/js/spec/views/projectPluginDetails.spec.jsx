import React from 'react';
import PropTypes from 'prop-types';

import {mount} from 'enzyme';
import ProjectPluginDetailsContainer, {
  ProjectPluginDetails,
} from 'app/views/projectPluginDetails';

jest.mock('jquery');

describe('ProjectPluginDetails', function() {
  let component;
  let org = TestStubs.Organization();
  let project = TestStubs.Project();
  let plugins = TestStubs.Plugins();
  let plugin = TestStubs.Plugin();
  let pluginId = plugin.id;

  beforeAll(function() {
    sinon.stub(console, 'info');
  });

  beforeEach(function() {
    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/plugins/`,
      method: 'GET',
      body: plugins,
    });

    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/plugins/${pluginId}/`,
      method: 'DELETE',
    });

    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/plugins/${pluginId}/`,
      method: 'GET',
      body: plugin,
    });

    MockApiClient.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/plugins/${pluginId}/`,
      method: 'POST',
      body: {
        ...plugin,
        config: [{value: 'default'}],
      },
    });

    component = mount(
      <ProjectPluginDetailsContainer
        organization={org}
        project={project}
        params={{orgId: org.slug, projectId: project.slug, pluginId: 'amazon-sqs'}}
        location={TestStubs.location()}
      />,
      {
        context: {
          router: TestStubs.router(),
        },

        childContextTypes: {
          router: PropTypes.object,
        },
      }
    );
  });

  afterAll(function() {
    // eslint-disable-next-line no-console
    console.info.restore();
  });

  it('renders', function() {
    expect(component).toMatchSnapshot();
  });

  it('resets plugin', function() {
    // Test component instead of container so that we can access state
    let wrapper = mount(
      <ProjectPluginDetails
        organization={org}
        project={project}
        plugins={TestStubs.Plugins()}
        params={{orgId: org.slug, projectId: project.slug, pluginId: 'amazon-sqs'}}
        location={TestStubs.location()}
      />,
      {
        context: {
          router: TestStubs.router(),
        },

        childContextTypes: {
          router: PropTypes.object,
        },
      }
    );

    let btn = wrapper.find('button').at(1);
    btn.simulate('click');
    expect(wrapper.state().pluginDetails.config[0].value).toBe('default');
  });

  it('enables/disables plugin', async function() {
    let btn = component.find('button').first();
    expect(btn.text()).toBe('Enable Plugin');

    btn.simulate('click');
    await tick();
    component.update();

    expect(
      component
        .find('button')
        .first()
        .text()
    ).toBe('Disable Plugin');
  });
});
