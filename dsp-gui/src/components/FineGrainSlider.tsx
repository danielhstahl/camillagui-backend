import { Col, InputNumber, Row, Slider } from 'antd';

type GenFn = (value: number) => void


const FineGrainSlider = ({ label, value, onChange, stepSize = 0.01, min = 0.0, max = 1.1 }: { label: string, value: number, onChange: GenFn, stepSize?: number, min?: number, max?: number }) => {
    const onChangeLocal = (value: number) => {
        if (isNaN(value)) {
            return;
        }
        onChange(value);
    };

    return (
        <Row className="site-card-border-less-wrapper">
            <Col span={24}>
                {label}
            </Col>
            <Col span={17} >
                <Slider
                    min={min}
                    max={max}
                    onChange={onChangeLocal}
                    value={value}
                    step={stepSize}
                />
            </Col>
            <Col span={7}>
                <InputNumber
                    min={min}
                    max={max}
                    step={stepSize}
                    value={value}
                    onChange={onChangeLocal}
                />
            </Col>
        </Row>
    );
};

export default FineGrainSlider