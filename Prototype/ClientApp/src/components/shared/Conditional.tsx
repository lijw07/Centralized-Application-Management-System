interface ConditionalProps {
    showIf: boolean;
    children: React.ReactNode;
}

const Conditional: React.FC<ConditionalProps> = ({ showIf, children }) => {
    return showIf ? <>{children}</> : null;
};

export default Conditional;
