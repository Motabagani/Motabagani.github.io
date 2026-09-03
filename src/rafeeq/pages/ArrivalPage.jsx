// Phase page — edit the steps themselves in phases/*.jsx.
import PhaseShell from '../components/PhaseShell.jsx';
import { useEffect } from 'react';
import { useRafeeq } from '../RafeeqContext.jsx';

export default function ArrivalPage() {
  // The arrival phase inherits the term and courses registered before travel.
  const { seedArrival } = useRafeeq();
  useEffect(() => { seedArrival(); }, []);  return <PhaseShell phaseId="p3" />;
}
