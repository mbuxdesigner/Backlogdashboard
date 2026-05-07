// Mock data for local dev (when no GAS_API_URL is set)
import { TODAY, addDays } from './data.js';

function build(start, segments) {
  const phases = [];
  let cur = new Date(start);
  for (const [phase, days] of segments) {
    const end = addDays(cur, days);
    phases.push({ phase, start: cur, end });
    cur = end;
  }
  return phases;
}

export const MOCK_DATA = {
  SQUADS: ['All', 'Squad Aurora', 'Squad Coral', 'Squad Pine', 'Squad Lumen'],
  FEATURES: [
    {
      id: 'f1', name: 'Onboarding 2.0', squad: 'Squad Aurora',
      tasks: [
        { id: 't1', name: 'Welcome flow redesign', assignee: 'Linh Phạm', squad: 'Squad Aurora', status: 'Ready to Dev',
          phases: build(addDays(TODAY, -22), [['Concept',2],['Define',3],['Wireframe',4],['UI',6],['HOD Review',2],['Sent to PO',2],['PO Pending',3],['Ready to Dev',4]]) },
        { id: 't2', name: 'Account verification screens', assignee: 'Minh Trần', squad: 'Squad Aurora', status: 'HOD Review',
          phases: build(addDays(TODAY, -14), [['Define',2],['Wireframe',3],['UI',5],['Update',2],['HOD Review',2]]) },
        { id: 't3', name: 'Empty-state illustrations', assignee: 'An Nguyễn', squad: 'Squad Aurora', status: 'UI',
          phases: build(addDays(TODAY, -6), [['Concept',2],['UI',4],['Update',2]]) },
      ]
    },
    {
      id: 'f2', name: 'Payments Refresh', squad: 'Squad Coral',
      tasks: [
        { id: 't4', name: 'Checkout simplification', assignee: 'Hà Vũ', squad: 'Squad Coral', status: 'Release',
          phases: build(addDays(TODAY, -28), [['Define',3],['Wireframe',4],['UI',7],['Update',3],['HOD Review',2],['Sent to PO',2],['PO Pending',4],['Ready to Dev',3],['UAT',3],['Release',1]]) },
        { id: 't5', name: 'Refund request flow', assignee: 'Bảo Lê', squad: 'Squad Coral', status: 'UI',
          phases: build(addDays(TODAY, -10), [['Wireframe',3],['UI',5],['Update',2]]) },
        { id: 't6', name: 'Saved payment methods', assignee: 'Khoa Đỗ', squad: 'Squad Coral', status: 'Define',
          phases: build(addDays(TODAY, -4), [['Concept',2],['Define',3]]) },
      ]
    },
    {
      id: 'f3', name: 'Reporting Hub', squad: 'Squad Pine',
      tasks: [
        { id: 't7', name: 'Weekly digest email', assignee: 'Quân Hồ', squad: 'Squad Pine', status: 'UAT',
          phases: build(addDays(TODAY, -20), [['Concept',2],['Wireframe',3],['UI',5],['HOD Review',2],['Sent to PO',2],['PO Pending',3],['Ready to Dev',2],['UAT',2]]) },
        { id: 't8', name: 'Custom dashboard widgets', assignee: 'Thư Lý', squad: 'Squad Pine', status: 'HOD Review',
          phases: build(addDays(TODAY, -16), [['Define',3],['Wireframe',4],['UI',6],['Update',2],['HOD Review',2]]) },
        { id: 't9', name: 'Export presets (CSV/PDF)', assignee: 'Nam Bùi', squad: 'Squad Pine', status: 'Wireframe',
          phases: build(addDays(TODAY, -3), [['Wireframe',3],['UI',4]]) },
      ]
    },
    {
      id: 'f4', name: 'Notifications', squad: 'Squad Lumen',
      tasks: [
        { id: 't10', name: 'In-app notification center', assignee: 'Phúc Mai', squad: 'Squad Lumen', status: 'Sent to PO',
          phases: build(addDays(TODAY, -12), [['Concept',2],['Wireframe',3],['UI',5],['Sent to PO',2]]) },
        { id: 't11', name: 'Push notification templates', assignee: 'Linh Phạm', squad: 'Squad Lumen', status: 'HOD Review',
          phases: build(addDays(TODAY, -8), [['Define',3],['UI',4],['HOD Review',2]]) },
        { id: 't12', name: 'Email digest preferences', assignee: 'An Nguyễn', squad: 'Squad Lumen', status: 'New',
          phases: build(addDays(TODAY, 1), [['New',1],['Concept',2]]) },
      ]
    },
  ],
  WEEKLY: [
    { label: 'W18', value: 14 },
    { label: 'W19', value: 18 },
    { label: 'W20', value: 16 },
    { label: 'W21', value: 21 },
    { label: 'W22', value: 19 },
    { label: 'W23', value: 23, current: true },
  ],
  GOLIVE: [
    { feature: 'Payments Refresh', task: 'Checkout simplification', date: addDays(TODAY, -2) },
    { feature: 'Reporting Hub', task: 'Filter & saved-views', date: addDays(TODAY, -8) },
    { feature: 'Mobile Settings', task: 'Account deletion flow', date: addDays(TODAY, -14) },
  ],
  lastUpdated: 'Demo mode',
};
