import FormField from './FormField';

function MatchFilters({ filters, onChange, interestOptions }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  const handleInterestToggle = (interestId) => {
    const current = new Set(filters.interests);
    if (current.has(interestId)) {
      current.delete(interestId);
    } else {
      current.add(interestId);
    }
    onChange({ ...filters, interests: Array.from(current) });
  };

  const clearFilters = () => {
    onChange({ gender: '', city: '', religion: '', age_min: '', age_max: '', interests: [] });
  };

  return (
    <section className="card">
      <header className="card-header">
        <h2>Refine Suggestions</h2>
        <button type="button" className="btn link" onClick={clearFilters}>
          Clear all
        </button>
      </header>
      <div className="filter-grid">
        <FormField label="Gender" id="gender">
          <select id="gender" name="gender" value={filters.gender} onChange={handleChange}>
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
          </select>
        </FormField>
        <FormField label="City" id="city">
          <input id="city" name="city" value={filters.city} onChange={handleChange} />
        </FormField>
        <FormField label="Religion" id="religion">
          <input id="religion" name="religion" value={filters.religion} onChange={handleChange} />
        </FormField>
        <FormField label="Minimum Age" id="age_min">
          <input
            id="age_min"
            name="age_min"
            type="number"
            min="18"
            max="100"
            value={filters.age_min}
            onChange={handleChange}
          />
        </FormField>
        <FormField label="Maximum Age" id="age_max">
          <input
            id="age_max"
            name="age_max"
            type="number"
            min="18"
            max="100"
            value={filters.age_max}
            onChange={handleChange}
          />
        </FormField>
      </div>
      <div className="interest-filter">
        <p>Interests</p>
        <div className="tag-grid">
          {interestOptions.map((interest) => {
            const isActive = filters.interests.includes(String(interest.id));
            return (
              <button
                key={interest.id}
                type="button"
                className={`tag selectable ${isActive ? 'active' : ''}`}
                onClick={() => handleInterestToggle(String(interest.id))}
              >
                #{interest.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MatchFilters;
