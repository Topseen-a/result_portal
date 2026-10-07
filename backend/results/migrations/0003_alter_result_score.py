from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('results', '0002_rename_results_result_alter_result_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='result',
            name='score',
            field=models.DecimalField(decimal_places=2, max_digits=5),
        ),
    ]