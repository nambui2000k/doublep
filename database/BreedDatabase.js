const Breed = require('../model/breed')

const BreedDatabase = {
    getBreedById: async (id) => {
        try {
            return await Breed.findOne({_id: id})
        } catch (e) {
            return null
        }
    }
}

module.exports = BreedDatabase