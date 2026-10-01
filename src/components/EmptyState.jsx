export default function EmptyState() {
  return (
    <div className="empty-state" data-testid="empty-state">
      <p className="empty-state__title">No todos yet</p>
      <p className="empty-state__text">
        Add your first todo using the field above.
      </p>
    </div>
  );
}