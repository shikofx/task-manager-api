require('../src/db/mongooseApp');
const Task = require('../src/models/task');

// Task.count( { } ).then((number) => {
//     console.log(`Вначале у нас ${number} задачи`);
//     return Task.findByIdAndDelete('5db854ce12edf31390479e6c');
// }).then(result => {
//     console.log('Удаляем запись:\n');
//     console.log(result);
//     return Task.countDocuments( {} )
// }).then(number => {
//     console.log(`Осталось записей ${number}`);
// }).catch(error => {
//     console.log(error.message);
// })

const findTaskByIdAndDelete = async (id) => {
    try{
        const countBeforeDeleting = await Task.count( { } );
        console.log(`Вначале у нас ${countBeforeDeleting} задач`);
        console.log('Удалим запись...\n');
        const deletedItem = await Task.findByIdAndDelete(id);
        console.log(deletedItem);
        console.log(`Осталось записей ${await Task.count()}`);    
    } catch (error) {
        console.log(error.message);
    }
}

findTaskByIdAndDelete('5db8547312edf31390479e6a');