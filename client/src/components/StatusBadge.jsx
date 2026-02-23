const StatusBadge = ({ status }) => {
    const classes = {
        Pending: 'badge-pending',
        Approved: 'badge-approved',
        Rejected: 'badge-rejected',
    };
    return (
        <span className={classes[status] || 'badge-pending'}>
            {status}
        </span>
    );
};

export default StatusBadge;
