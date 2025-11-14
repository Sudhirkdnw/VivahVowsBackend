function FormField({ label, id, type = 'text', value, onChange, children, ...rest }) {
  if (children) {
    return (
      <label className="form-field" htmlFor={id}>
        <span>{label}</span>
        {children}
      </label>
    );
  }

  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} type={type} value={value} onChange={onChange} {...rest} />
    </label>
  );
}

export default FormField;
