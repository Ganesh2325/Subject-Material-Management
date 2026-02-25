import { Client } from '@elastic/elasticsearch';

const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

let client;

try {
  client = new Client({ node });
  // eslint-disable-next-line no-console
  console.log(`Elasticsearch client configured for ${node}`);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Failed to create Elasticsearch client:', err.message);
}

const SUBJECT_INDEX = 'acos-subjects';
const MATERIAL_INDEX = 'acos-materials';

const isSearchEnabled = () => Boolean(client);

export const indexSubject = async (subject) => {
  if (!isSearchEnabled()) return;

  try {
    await client.index({
      index: SUBJECT_INDEX,
      id: subject._id.toString(),
      document: {
        subjectId: subject._id.toString(),
        name: subject.name,
        code: subject.code,
        semester: subject.semester,
        createdBy: subject.createdBy?.toString?.() ?? null,
        units: subject.units?.map((u) => ({
          unitId: u._id.toString(),
          title: u.title
        })),
        createdAt: subject.createdAt || new Date()
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to index subject in Elasticsearch:', err.message);
  }
};

export const indexMaterial = async (subject, unit, material) => {
  if (!isSearchEnabled()) return;

  try {
    const id = `${subject._id.toString()}-${unit._id.toString()}-${material._id.toString()}`;

    await client.index({
      index: MATERIAL_INDEX,
      id,
      document: {
        materialId: material._id.toString(),
        subjectId: subject._id.toString(),
        unitId: unit._id.toString(),
        subjectName: subject.name,
        subjectCode: subject.code,
        unitTitle: unit.title,
        title: material.title,
        fileUrl: material.fileUrl,
        uploadedBy: material.uploadedBy?.toString?.() ?? null,
        createdAt: material.createdAt || new Date()
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to index material in Elasticsearch:', err.message);
  }
};

export const searchContent = async (query) => {
  if (!isSearchEnabled()) {
    return { subjects: [], materials: [], disabled: true };
  }

  const trimmed = query?.trim();
  if (!trimmed) {
    return { subjects: [], materials: [], disabled: false };
  }

  try {
    const [subjectResult, materialResult] = await Promise.all([
      client.search({
        index: SUBJECT_INDEX,
        query: {
          multi_match: {
            query: trimmed,
            fields: ['name^3', 'code^4', 'semester', 'units.title']
          }
        }
      }),
      client.search({
        index: MATERIAL_INDEX,
        query: {
          multi_match: {
            query: trimmed,
            fields: ['title^3', 'unitTitle', 'subjectName', 'subjectCode']
          }
        }
      })
    ]);

    const subjects =
      subjectResult.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source
      })) || [];

    const materials =
      materialResult.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source
      })) || [];

    return { subjects, materials, disabled: false };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Elasticsearch search error:', err.message);
    return { subjects: [], materials: [], disabled: false, error: err.message };
  }
};

