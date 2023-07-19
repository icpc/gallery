import MySelect from "../UI/Select/MySelect";

const Selector = ({ leftIcon, func, name, value, options }) => {
    return (
        <div className="selector-wrapper">
            <MySelect options={options} onChange={func} name={name} value={value} leftIcon={leftIcon} />
        </div>
    );
};

export default Selector;
