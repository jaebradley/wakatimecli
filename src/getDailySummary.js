import { WakaTimeClient } from 'wakatime-client';

import setup from './setup';
import { get } from './services/apiKeyStore';
import generateDailySummary from './services/generateDailySummary';
import getRegex from './services/getRegex';

const getDailySummary = async ({
  date = new Date(),
  editorsFilter = null,
  languagesFilter = null,
  projectsFilter = null,
}) => {
  let apiKey = await get();

  if (!apiKey) {
    await setup();
    apiKey = await get();
  }

  // PAGING DR.HACKY AS FUCK, PAGING DR.HACKY AS FUCK
  const formattedDate = date.toISOString().split('T')[0];

  const client = new WakaTimeClient(apiKey);
  const summary = await client.getMySummary({
    dateRange: {
      startDate: formattedDate,
      endDate: formattedDate,
    },
  });

  const filteredData = summary.data.map(({
    grand_total: grandTotal,
    range,
    editors,
    languages,
    projects,
  }) => ({
    grandTotal,
    range,
    editors: editors.filter(
      ({ name }) => editorsFilter == null || getRegex(editorsFilter).test(name),
    ),
    languages: languages.filter(
      ({ name }) => languagesFilter == null || getRegex(languagesFilter).test(name),
    ),
    projects: projects.filter(
      ({ name }) => projectsFilter == null || getRegex(projectsFilter).test(name),
    ),
  }));

  filteredData.forEach(({
    grandTotal,
    range,
    editors,
    languages,
    projects,
  }) => generateDailySummary({
    grandTotal,
    range,
    editors,
    languages,
    projects,
  }));
};

export default getDailySummary;
