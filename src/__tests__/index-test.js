import createEngine from '../';

describe('engine', () => {
    beforeEach(() => {
        global.localStorage = {
            getItem: sinon.stub().returns(null),
            setItem: sinon.stub()
        };
    });

    afterEach(() => {
        delete global.localStorage;
    });

    describe('load', () => {
        it('should load via getItem', async () => {
            localStorage.getItem.returns('{"a":1}');

            const engine = createEngine('key');
            const result = await engine.load();

            localStorage.getItem.should.have.been.called;
            result.should.deep.equal({ a: 1 });
        });

        it('should load with the given key', async () => {
            const engine = createEngine('key');
            await engine.load();

            localStorage.getItem.should.have.been.calledWith('key');
        });

        it('should fallback to empty dict', async () => {
            const engine = createEngine('key');
            const result = await engine.load();

            localStorage.getItem.should.have.been.called;
            result.should.be.a.dict;
            result.should.be.empty;
        });

        it('should reject when localStorage is not present', () => {
            delete global.localStorage;

            const engine = createEngine('key');
            return engine.load()
                .should.eventually.be.rejectedWith('localStorage is not defined');
        });

        it('should reject if json cannot be loaded', async () => {
            localStorage.getItem.returns('{"a');
            const engine = createEngine('key');

            return engine.load()
                .should.eventually.be.rejectedWith('Unexpected token a');
        });

        it('should use a provided reviver', async () => {
            const reviver = sinon.stub();
            const engine = createEngine('key', null, reviver);

            await engine.load();

            reviver.should.have.been.called;
        });
    });

    describe('save', () => {
        it('should asve via setItem', async () => {
            const engine = createEngine('key');
            await engine.save({});

            localStorage.setItem
                .should.have.been.called;
        });

        it('should load with the given key', async () => {
            const engine = createEngine('key');
            await engine.save({});

            localStorage.setItem
                .should.have.been.calledWith('key');
        });

        it('should save the passed state as json', async () => {
            const engine = createEngine('key');
            await engine.save({ a: 1 });

            localStorage.setItem
                .should.have.been.calledWith(sinon.match.any, '{"a":1}');
        });

        it('should reject when localStorage is not present', () => {
            delete global.localStorage;

            const engine = createEngine('key');
            return engine.save({})
                .should.eventually.be.rejectedWith('localStorage is not defined');
        });

        it('should reject if json cannot be serialized', async () => {
            const engine = createEngine('key');
            const a = {};
            a.a = a;

            return engine.save(a)
                .should.eventually.be.rejectedWith('Converting circular structure to JSON');
        });

        it('should use a provided replacer', async () => {
            const replacer = sinon.stub();
            const engine = createEngine('key', replacer);

            await engine.save({});

            replacer.should.have.been.called;
        });
    });
});
