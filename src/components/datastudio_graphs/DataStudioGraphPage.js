import React from 'react';
import AppConfig from "../../AppConfig";

const DataStudioGraphPage = () => {
    return (
        AppConfig.DATA_STUDIO_GRAPH_URL && (
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <iframe
                    title="graph"
                    width="1000"
                    height="800"
                    src={AppConfig.DATA_STUDIO_GRAPH_URL}
                    frameBorder="0"
                    style={{ border: 0, margin: 'auto' }}
                    allowFullScreen
                />
            </div>
        )
    );
};

export default DataStudioGraphPage;
