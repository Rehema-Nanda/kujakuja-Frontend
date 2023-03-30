import {
    getDefinedParams, getQueryParamsFromUrl, remapQueryParamsToGlobalFilterStateVariableNames, getGlobalFilterParams
} from '../helpers';
import moment from 'moment';

describe('#helper functions', () => {
    it('getDefinedParams should return only defined params in an object', () => {
        const testParams = {
            start: 'test',
            end: '',
            service_types: ['2', '4', '5'],
            countries: ['176', '177'],
            types: []
        };
        const expectedParams = {
            start: 'test',
            service_types: ['2','4', '5'],
            countries: ['176', '177']
        };
        const returnedParams = getDefinedParams(testParams);
        expect(returnedParams).toMatchObject(expectedParams);
    });

    it('getQueryParamsFromUrl should return params in the query as an object', () => {
        const testQuery = '?start=2019-07-01&end=2019-08-12&countries=176%2C177&keyword=money';
        const expectedResult = {
            start: '2019-07-01',
            end: '2019-08-12',
            countries: ['176', '177'],
            keyword: 'money'
        };
        const returnedParams = getQueryParamsFromUrl(testQuery);
        expect(returnedParams).toMatchObject(expectedResult);
    });

    it('remapQueryParamsToGlobalFilterStateVariableNames should rename params to the expected global filter state variable names', () => {
        const testParams = {
            countries: ['176', '177'],
            settlements: ['1', '2'],
            points: ['12', '13'],
            service_types: ['2', '4', '5'],
            start: '2019-08-01',
            end: '2019-08-02'
        };
        const expectedParams = {
            selectedCountries: ['176', '177'],
            selectedLocations: ['1', '2'],
            selectedServicePoints: ['12', '13'],
            selectedServiceTypes: ['2','4', '5'],
            dateStart: '2019-08-01',
            dateEnd: '2019-08-02'
        };
        const returnedParams = remapQueryParamsToGlobalFilterStateVariableNames(testParams);
        expect(returnedParams).toMatchObject(expectedParams);

        const testParams2 = {
            types: ['2', '4', '5']
        };
        const expectedParams2 = {
            selectedServiceTypes: ['2','4', '5']
        };

        const returnedParams2 = remapQueryParamsToGlobalFilterStateVariableNames(testParams2);
        expect(returnedParams2).toMatchObject(expectedParams2);
    });

    it('getGlobalFilterParams should return only global filter params', () => {
        const testParams = {
            dateStart: '2019-08-01',
            selectedServiceTypes: ['2', '4', '5'],
            selectedCountries: ['176', '177'],
            page: 1,
            limit: 50,
            keyword: 'test'
        };
        const expectedParams = {
            dateStart: moment.utc('2019-08-01'),
            selectedServiceTypes: ['2', '4', '5'],
            selectedCountries: ['176', '177']
        };
        const returnedParams = getGlobalFilterParams(testParams);
        expect(returnedParams).toMatchObject(expectedParams);
    });
});
